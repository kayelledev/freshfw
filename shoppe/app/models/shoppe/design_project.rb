module Shoppe
  class DesignProject < ActiveRecord::Base
  	belongs_to :user, :class_name => 'Shoppe::User'
  	belongs_to :room_type, :class_name => 'Shoppe::RoomType'
  end
end
