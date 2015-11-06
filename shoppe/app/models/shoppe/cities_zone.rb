module Shoppe
  class CitiesZone < ActiveRecord::Base
  	belongs_to :city
    belongs_to :zone
    validates :city_id, uniqueness: {scope: :zone_id}
  end
end
