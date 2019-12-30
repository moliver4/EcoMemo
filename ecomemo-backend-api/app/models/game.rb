class Game < ApplicationRecord
    belongs_to :user

    def self.top_ten 
        self.all.sort_by {|game| game.totaltime}
    end
end
