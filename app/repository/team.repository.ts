import { TeamRole } from '@open-template-hub/common';
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

  update = async( teamId: string, payload: any ) => {
    try {
      return await this.dataModel.findOneAndUpdate(
        {
          team_id: teamId
        },
        {
          payload
        },
        {
          returnOriginal: false
        }
      )
    } catch ( error ) {
      console.error( '> updateTeam error ', error );
    }
  }

  addMember = async (
    teamId: string,
    member: {
      username: string | undefined,
      email: string,
      isVerified: boolean,
      payload: any
    },
    teamRole: TeamRole.READER | TeamRole.WRITER
  ) => {
    try {
      let targetTeamArray: { writers: any } | { readers: any };

      if ( teamRole === TeamRole.READER ) {
        targetTeamArray = { readers: member }
      }
      else {
        targetTeamArray = { writers: member }
      }

      return await this.dataModel.findOneAndUpdate(
          {
            team_id: teamId,
            'writers.email': { $ne: member.email },
            'readers.email': { $ne: member.email },
            'creator': { $ne: member.username }
          },
          {
            $addToSet: targetTeamArray
          },
          {
            returnOriginal: false
          }
      );
    } catch ( error ) {
      console.error( '> addWriter error: ', error );
      throw error;
    }
  };

  removeMember = async (
    teamId: string,
    username: string,
    teamRole: TeamRole.READER | TeamRole.WRITER
  ) => {
    try {
      let targetTeamArray: { writers: any } | { readers: any };

      if ( teamRole === TeamRole.READER) {
        targetTeamArray = { readers: { username } }
      }
      else {
        targetTeamArray = { writers: { username } }
      }

      return await this.dataModel.findOneAndUpdate(
        {
          team_id: teamId
        },
        {
          $pull: targetTeamArray
        },
        {
          returnOriginal: false
        }
      )
    } catch ( error ) {
      console.error( '> removeMember error: ', error );
      throw error;
    }
  }

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
        return await this.dataModel.findOneAndUpdate(
            { team_id: teamId, 'writers.email': email },
            {
              $set: {
                'writers.$.username': username,
                'writers.$.isVerified': true
              }
            },
            {
              returnOriginal: false
            }
        );
      } else if ( role === 'readers' ) {
        return await this.dataModel.findOneAndUpdate(
            { team_id: teamId, 'readers.email': email },
            {
              $set: {
                'readers.$.username': username,
                'readers.$.isVerified': true
              }
            },
            {
              returnOriginal: false
            }
        );
      }

    } catch ( error ) {
      console.error( '> verifyTeam error: ', error );
      throw error;
    }
  };

  deleteTeam = async (
      teamId: string
  ) => {
    try {
      return await this.dataModel.findOneAndDelete(
          { team_id: teamId }
      );
    } catch ( error ) {
      console.error( '> deleteTeam error: ', error );
      throw error;
    }
  };
}
