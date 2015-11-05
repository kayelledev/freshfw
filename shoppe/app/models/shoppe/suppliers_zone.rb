module Shoppe
  class SuppliersZone < ActiveRecord::Base
  	belongs_to :supplier
    belongs_to :zone
  end
end
