module Shoppe
  class SuppliersZone < ActiveRecord::Base
  	belongs_to :supplier
    belongs_to :zone
    validates :supplier_id, uniqueness: {scope: :zone_id}
  end
end
