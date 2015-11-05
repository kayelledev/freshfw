module Shoppe
  class CitiesZone < ActiveRecord::Base
  	belongs_to :city
    belongs_to :zone
  end
end
