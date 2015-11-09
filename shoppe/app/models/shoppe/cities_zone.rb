module Shoppe
  class CitiesZone < ActiveRecord::Base
  	belongs_to :city, :class_name => 'Shoppe::City'
    belongs_to :zone, :class_name => 'Shoppe::Zone'
    validates :city_id, uniqueness: {scope: :zone_id}
  end
end
