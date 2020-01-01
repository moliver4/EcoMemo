class GamesController < ApplicationController

    def index
        topGames = Game.top_ten
        render json: topGames.to_json(:include => {
            :user => {:only => [:username, :id]}
          }, :except => [:updated_at])
    end


    def create
        user = User.find_by(username: params[:username])
        game = Game.create(comment: params[:comment], totaltime: params[:totaltime], user_id: user.id)
        render json: game
    end

    def destroy
        game = Game.find_by(id: params[:id])
        game.destroy
        render json: game
    end


    private 

    def user_params
        params.require(:user).permit(:user_id, :username, :comment, :totaltime)
    end
end
