// src/workspaces/models/workspace.model.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export type WorkspaceDocument = Workspace & Document;

@Schema()
export class Workspace {
  @Prop({ type: mongoose.Schema.Types.ObjectId })
  userId: mongoose.Schema.Types.ObjectId;

  @Prop({})
  name: string;


}

export const WorkspaceSchema = SchemaFactory.createForClass(Workspace);
