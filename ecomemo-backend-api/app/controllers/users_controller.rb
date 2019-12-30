class UsersController < ApplicationController

    def show
        user = User.find_or_create_by(username: params[:username])
        render json: user.slice(:id, :username)
    end


    def showgames
        user = User.find_by(id: params[:id])
        render json: user.slice(:id, :name, :username)
    end

end
