module Shoppe
  class City < ActiveRecord::Base
  	belongs_to :country, :class_name => 'Shoppe::Country'
  	has_many  :cities_zones, dependent: :destroy
    has_many  :zones, through: :cities_zones
    validates :name, :presence => true
  end
end
