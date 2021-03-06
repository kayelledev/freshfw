module Shoppe
  class SuppliersZone < ActiveRecord::Base
  	belongs_to :supplier, :class_name => 'Shoppe::Supplier'
    belongs_to :zone, :class_name => 'Shoppe::Zone'
    has_many  :freight_routes, dependent: :destroy, :class_name => 'Shoppe::FreightRoute'
    validates :supplier_id, uniqueness: {scope: :zone_id}

    def supplier_zone
      "supplier: #{supplier.name}, zone: #{zone.name}"
    end
  end
end
