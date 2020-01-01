class UsersController < ApplicationController


    def show
        user = User.find_by(id: params[:id])
        games = user.games
        render json: games.to_json(:include => {
            :user => {:only => [:username, :id]}
          }, :except => [:updated_at])
    end

    def create 
        user = User.find_by(username: params[:username])
        if (!user)
            user = User.create(username: params[:username])
        end
        render json: user
    end

    def destroy
        user = User.find_by(id: params[:id])
        games = user.games    
        user.destroy
       
        games.each {|game| game.destroy}
        render json: user
    end


    private

    def user_params
      params.require(:user).permit(:id, :username)
    end

end
