module Shoppe
  class City < ActiveRecord::Base
  	belongs_to :country, :class_name => 'Shoppe::Country'
  	has_many  :cities_zones, dependent: :destroy, :class_name => 'Shoppe::CitiesZone'
    has_many  :zones, through: :cities_zones, :class_name => 'Shoppe::Zone'
    validates :name, :presence => true
  end
end
