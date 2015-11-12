module Shoppe
  class LastMileCompany < ActiveRecord::Base
  	has_many  :last_mile_companies_zones, dependent: :destroy, :class_name => 'Shoppe::LastMileCompaniesZone'
    has_many  :zones, through: :last_mile_companies_zones, :class_name => 'Shoppe::Zone'
    validates :name, :presence => true
  
    def self.search(zones)
      self.joins(:zones).where("shoppe_zones.id": zones)
    end
  end
end
