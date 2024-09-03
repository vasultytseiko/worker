import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { RedisService } from 'src/redis/redis.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { SignUpDto } from './dto/user.dto';
import { User, UserDocument } from './entities/user.entity';

export function hash(value: string, saltOrRounds: number | string): string {
  return bcrypt.hashSync(value, saltOrRounds);
}

export function compare(value: string, hashedValue: string): boolean {
  return bcrypt.compareSync(value, hashedValue);
}

export interface ITokenPayload {
  userId: string;
  name: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    protected userModel: Model<UserDocument>,
    private jwtService: JwtService,
    @Inject('RedisService')
    private redisService: RedisService,
  ) {}

  async signUp(userData: SignUpDto) {
    const hashedPassword = hash(userData.password, 12);
    userData.password = hashedPassword;

    return this.userModel.create(userData);
  }

  async signIn(login: string, password: string) {
    try {
      const user = await this.userModel.findOne({ login }).exec();

      const passwordCompare = compare(password, user.password);

      if (!passwordCompare) {
        throw new UnauthorizedException('Invalid password');
      }

      const accessToken = await this.signAccessToken({
        userId: user._id,
        name: user.name,
      });

      const refreshToken = await this.signRefreshToken({
        userId: user._id,
        name: user.name,
      });

      return { ...accessToken, ...refreshToken };
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }

  async findAll() {
    return this.userModel.find().populate({ path: 'workspaces' }).exec();
  }

  async findOne(id: string) {
    const user = await this.userModel
      .findById(id)
      .populate({ path: 'workspaces', populate: { path: 'messages' } });

    return user;
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return this.userModel.findByIdAndUpdate(id, updateUserDto);
  }

  remove(id: string) {
    return this.userModel.findByIdAndDelete(id).exec();
  }

  private async signAccessToken(
    payload: ITokenPayload,
  ): Promise<{ accessToken: string }> {
    const token = this.jwtService.sign(payload);

    await this.setToken('access_token', token, payload.userId);

    return {
      accessToken: token,
    };
  }

  private async signRefreshToken(
    payload: ITokenPayload,
  ): Promise<{ refreshToken: string }> {
    const existingToken = await this.getToken('refresh_token');
    if (existingToken) {
      await this.removeToken(payload.userId);
    }

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: `5h`,
    });

    await this.setToken('refresh_token', refreshToken, payload.userId);
    return {
      refreshToken,
    };
  }

  public decode(token: string): any {
    return this.jwtService.decode(token);
  }

  async setToken(key: string, token: string, user: string) {
    return this.redisService.set(
      key,
      JSON.stringify({
        user_id: user,
        token: token,
      }),
      +process.env.EXPIRATION_TIME,
    );
  }

  async removeToken(key: string) {
    return this.redisService.delete(key);
  }

  async getToken(key: string) {
    return this.redisService.get(key);
  }
}
