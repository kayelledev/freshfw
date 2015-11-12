module Shoppe
  class FreightCompany < ActiveRecord::Base
  	has_many  :freight_companies_zones, dependent: :destroy, :class_name => 'Shoppe::FreightCompaniesZone'
    has_many  :zones, through: :freight_companies_zones, :class_name => 'Shoppe::Zone'
    has_many  :freight_routes, dependent: :destroy, :class_name => 'Shoppe::FreightRoute'
    validates :name, presence: true
  
    def self.search(zones)
       self.joins(:zones).where("shoppe_zones.id": zones)
    end
  end
end
