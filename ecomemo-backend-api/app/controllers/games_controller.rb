class GamesController < ApplicationController

    def show
        topGames = Game.top_ten
        render json: topGames
    end


    def create
        user = User.find_by(username: params[:username])
        game = Game.create(comment: params[:comment], totaltime: params[:totaltime], user_id: user.id)
        render json: game
    end

    def destroy
        user = User.find_by(id: params[:user_id])
        game = Game.find_by(id: params[:id])
        game.destroy
    end


    private 

    def user_params
        params.require(:user).permit(:user_id, :username, :comment, :totaltime)
    end
end
