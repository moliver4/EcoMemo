class UsersController < ApplicationController

    def show
        user = User.find_or_create_by(username: params[:username])
        games = user.games
        render json: games
    end

    def create 
        user = User.find_or_create_by(username: params[:username])
        render json: user
    end


    private

    def user_params
      params.require(:user).permit(:id, :username)
    end

end
