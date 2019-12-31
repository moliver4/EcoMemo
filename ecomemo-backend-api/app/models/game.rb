class Game < ApplicationRecord
    belongs_to :user

    def self.top_ten 
        games = self.all.sort_by {|game| game.totaltime}
        return games.slice(0, 10)
    end
end
