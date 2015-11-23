module Shoppe
  class DesignProject < ActiveRecord::Base
  	belongs_to :user, :class_name => 'Shoppe::User'
  	belongs_to :room_type, :class_name => 'Shoppe::RoomType'
  	validates :name, presence: true
  	has_many  :design_projects_products, :class_name => 'Shoppe::DesignProjectsProduct'
  	has_many  :products, through: :design_projects_products, :class_name => 'Shoppe::Product'
  end
end
