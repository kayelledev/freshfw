module Shoppe
  class RoomType < ActiveRecord::Base
  	has_many :design_projects, :class_name => 'Shoppe::DesignProject'
    validates :name, :presence => true
  end
end
