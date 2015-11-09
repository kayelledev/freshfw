module Shoppe
  class FreightRoute < ActiveRecord::Base
  	belongs_to :freight_company, :class_name => 'Shoppe::FreightCompany'
  	belongs_to :zone, :class_name => 'Shoppe::Zone'
    belongs_to :suppliers_zone, :class_name => 'Shoppe::SuppliersZone'
  end
end
