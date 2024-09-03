import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Workspace } from 'src/workspaces/entities/workspace.entity';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  login: string;

  @Prop({ required: true })
  password: string;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' }])
  workspaces: [Workspace];
}

export const UserSchema = SchemaFactory.createForClass(User);
