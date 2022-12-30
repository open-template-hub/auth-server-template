import mongoose from 'mongoose';

export class TeamDataModel {
  private readonly collectionName: string = 'team';
  private readonly dataSchema: mongoose.Schema;

  constructor() {

    const writerSchema: mongoose.SchemaDefinition = {
      username: String,
      email: String,
      isVerified: Boolean
    };

    const readerSchema: mongoose.SchemaDefinition = {
      username: String,
      email: String,
      isVerified: Boolean
    };

    /**
     * This schema should be edited with feature necessities
     */
    const schema: mongoose.SchemaDefinition = {
      team_id: {
        type: String,
        unique: true,
        required: true,
        dropDups: true,
        default: new mongoose.Types.ObjectId().toString()
      },
      name: {
        type: String,
        required: true
      },
      imageId: { type: String },
      creator: {
        type: String,
        required: true
      },
      writers: {
        type: [ writerSchema.schema ],
        default: []
      },
      readers: {
        type: [ readerSchema.schema ],
        default: []
      }
    };

    this.dataSchema = new mongoose.Schema( schema );
  }

  getDataModel = async ( conn: mongoose.Connection ) => {
    return conn.model(
        this.collectionName,
        this.dataSchema,
        this.collectionName
    );
  };
}
