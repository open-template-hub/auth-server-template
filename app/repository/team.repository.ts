import { TeamDataModel } from "../data/team.data";

export class TeamRepository {
    private dataModel: any = null;

    initialize = async (connection: any) => {
        this.dataModel = await new TeamDataModel().getDataModel(connection);
        return this;
    };

    create = async(creator: string, name: string, imageId: string | undefined) => {
        try {
            return await this.dataModel.create({
                creator, name, imageId
            });
        } catch(error) {
            console.error( '> createTeam error: ', error );
            throw error;
        }
    }

    addWriter = async(
        creator: string,
        writer: {
            username: string,
            email: string,
            isVerified: boolean
        }
    ) => {
        try {
            return await this.dataModel.findOneAndUpdate(
                {
                    creator
                },
                {
                    $push: {
                        writers: writer
                    }
                }
            )
        } catch(error) {
            console.error( '> addWriter error: ', error );
            throw error;
        }
    }

    addReader = async(
        creator: string,
        reader: {
            username: string,
            email: string,
            isVerified: boolean
        }
    ) => {
        try {
            return await this.dataModel.findOneAndUpdate(
                {
                    creator
                },
                {
                    $push: {
                        readers: reader
                    }
                }
            ) 
        } catch(error) {
            console.error( '> addReader error: ', error );
            throw error;
        }
    }

    removeFromWriters = async(
        creator: string,
        writerUsername: string
    ) => {
        try {
            return await this.dataModel.findOneAndUpdate(
                {
                    creator
                },
                {
                    $pull: {
                        writers: {
                            $elemMatch: {
                                username: writerUsername
                            }
                        }
                    }
                }
            )
        } catch(error) {
            console.error( '> removeFromWriters error: ', error );
            throw error;
        }
    }

    removeFromReaders = async(
        creator: string,
        readerUsername: string
    ) => {
        try {
            return await this.dataModel.findOneAndUpdate(
                {
                    creator
                },
                {
                    $pull: {
                        readers: {
                            $elemMatch: {
                                username: readerUsername
                            }
                        }
                    }
                }
            )
        } catch(error) {
            console.error( '> removeFromReaders error: ', error );
            throw error;
        }
    }

    getTeams = async(
        username: string
    ) => {
        try {
            return await this.dataModel.find(
                { 
                    $or: [
                        { creator: username },
                        { writers: {
                            $elemMatch: {
                                username
                            }
                        }},
                        { readers: {
                            $elemMatch: {
                                username
                            }
                        }}
                    ]
                }
            )
        } catch(error) {
            console.error( '> getTeam error: ', error );
            throw error;
        }
    }

    verify = async(
        username: string,
        teamId: string,
        role: "writers" | "readers"
    ) => {
        try {
            if(role === "writers") {
                return await this.dataModel.updateOne(
                    { team_id: teamId, "writers.username": username },
                    { $set: {
                        "writers.$.isVerified": true
                    }}
                )
            }
            else if(role === "readers") {
                return await this.dataModel.updateOne(
                    { team_id: teamId, "readers.username": username },
                    { $set: {
                        "readers.$.isVerified": true
                    } }
                )
            }
            
        } catch(error) {
            console.error( '> verifyTeam error: ', error );
            throw error;
        }
    }

    deleteTeam = async(
        creator: string
    ) => {
        try {
            return await this.dataModel.findOneAndDelete(
                { creator }
            )
        } catch(error) {
            console.error( '> deleteTeam error: ', error );
            throw error;
        }
    }
}