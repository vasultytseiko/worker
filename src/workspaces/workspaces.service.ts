import { Injectable } from '@nestjs/common';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { Workspace, WorkspaceDocument } from './entities/workspace.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class WorkspacesService {
  constructor(
    @InjectModel(Workspace.name)
    private readonly workspaceModel: Model<WorkspaceDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<WorkspaceDocument>,
  ) {}
  async create(createWorkspaceDto: any) {
    const workspace = await this.workspaceModel.create(createWorkspaceDto);

    await this.userModel.findOneAndUpdate(
      { _id: createWorkspaceDto.userId },
      {
        $addToSet: { workspaces: workspace._id },
      },
      { new: true },
    );

    return workspace;
  }

  async findAll() {
    const data = await this.workspaceModel.find().exec();

    console.log(data);

    return data;
  }

  async findOne(id: string) {
    const data = await this.workspaceModel.findOne({ _id: id }).exec();

    return data;
  }

  update(id: string, updateWorkspaceDto: UpdateWorkspaceDto) {
    return this.workspaceModel.findByIdAndUpdate(id, updateWorkspaceDto).exec();
  }

  remove(id: string) {
    return this.workspaceModel.findByIdAndDelete(id).exec();
  }
}
