module Shoppe
  class FreightRoute < ActiveRecord::Base
  	belongs_to :freight_company, :class_name => 'Shoppe::FreightCompany'
  	belongs_to :zone, :class_name => 'Shoppe::Zone'
    belongs_to :suppliers_zone, :class_name => 'Shoppe::SuppliersZone'
  
    def self.search(supplier_zones, customer_zones)
      suppliers = Shoppe::SuppliersZone.where(zone_id: supplier_zones)
      self.where(suppliers_zone_id: suppliers, zone_id: customer_zones) 
    end
  end
end
