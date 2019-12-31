class GamesController < ApplicationController

    def create
        game = Game.create(comment: params[:comment], )
    end
end
