import { TeamDataModel } from '../data/team.data';

export class TeamRepository {
  private dataModel: any = null;

  initialize = async ( connection: any ) => {
    this.dataModel = await new TeamDataModel().getDataModel( connection );
    return this;
  };

  create = async ( creator: string, name: string, payload: any ) => {
    try {
      return await this.dataModel.create( {
        creator, name, payload
      } );
    } catch ( error ) {
      console.error( '> createTeam error: ', error );
      throw error;
    }
  };

  addWriter = async (
      teamId: string,
      writer: {
        username: string | undefined,
        email: string,
        isVerified: boolean,
        payload: any
      }
  ) => {
    try {
      return await this.dataModel.findOneAndUpdate(
          {
            team_id: teamId,
            "writers.email": { $ne: writer.email },
            "readers.email": { $ne: writer.email },
            "creator": { $ne: writer.username }
          },
          {
            $addToSet: {
              writers: writer
            }
          }
      );
    } catch ( error ) {
      console.error( '> addWriter error: ', error );
      throw error;
    }
  };

  addReader = async (
      teamId: string,
      reader: {
        username: string | undefined,
        email: string,
        isVerified: boolean,
        payload: any
      }
  ) => {
    try {
      return await this.dataModel.findOneAndUpdate(
          {
            team_id: teamId,
            "writers.email": { $ne: reader.email },
            "readers.email": { $ne: reader.email },
            "creator": { $ne: reader.username }
          },
          {
            $addToSet: {
              readers: reader
            }
          }
      );
    } catch ( error ) {
      console.error( '> addReader error: ', error );
      throw error;
    }
  };

  removeFromWriters = async (
      teamId: string,
      writerEmail: string
  ) => {
    try {
      return await this.dataModel.updateOne(
          {
            team_id: teamId
          },
          {
            $pull: {
              writers: {
                email: writerEmail
              }
            }
          }
      );
    } catch ( error ) {
      console.error( '> removeFromWriters error: ', error );
      throw error;
    }
  };

  removeFromReaders = async (
      teamId: string,
      readerEmail: string
  ) => {
    try {
      return await this.dataModel.updateOne(
          {
            team_id: teamId
          },
          {
            $pull: {
              readers: {
                email: readerEmail
              }
            }
          }
      );
    } catch ( error ) {
      console.error( '> removeFromReaders error: ', error );
      throw error;
    }
  };

  getTeams = async (
      username: string
  ) => {
    try {
      return await this.dataModel.find(
          {
            $or: [
              { creator: username },
              {
                writers: {
                  $elemMatch: {
                    username
                  }
                }
              },
              {
                readers: {
                  $elemMatch: {
                    username
                  }
                }
              }
            ]
          }
      );
    } catch ( error ) {
      console.error( '> getTeam error: ', error );
      throw error;
    }
  };

  verify = async (
      username: string,
      email: string,
      teamId: string,
      role: 'writers' | 'readers'
  ) => {
    // email should be written 
    try {
      if ( role === 'writers' ) {
        return await this.dataModel.updateOne(
            { team_id: teamId, 'writers.email': email },
            {
              $set: {
                'writers.$.username': username,
                'writers.$.isVerified': true
              }
            }
        );
      } else if ( role === 'readers' ) {
        return await this.dataModel.updateOne(
            { team_id: teamId, 'readers.email': email },
            {
              $set: {
                'readers.$.username': username,
                'readers.$.isVerified': true
              }
            }
        );
      }

    } catch ( error ) {
      console.error( '> verifyTeam error: ', error );
      throw error;
    }
  };

  deleteTeam = async (
      creator: string
  ) => {
    try {
      return await this.dataModel.findOneAndDelete(
          { creator }
      );
    } catch ( error ) {
      console.error( '> deleteTeam error: ', error );
      throw error;
    }
  };
}
