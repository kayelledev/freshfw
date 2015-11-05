module Shoppe
  class Zone < ActiveRecord::Base
  	has_many  :suppliers_zones, dependent: :destroy, :class_name => 'Shoppe::SuppliersZone'
    has_many  :suppliers, through: :suppliers_zones, :class_name => 'Shoppe::Supplier'
    has_many  :freight_companies_zones, dependent: :destroy, :class_name => 'Shoppe::FreightCompaniesZone'
    has_many  :freight_companies, through: :freight_companies_zones, :class_name => 'Shoppe::FreightCompany'
    has_many  :last_mile_companies_zones, dependent: :destroy, :class_name => 'Shoppe::LastMileCompaniesZone'
    has_many  :last_mile_companies, through: :last_mile_companies_zones, :class_name => 'Shoppe::LastMileCompany'
    has_many  :cities_zones, dependent: :destroy, :class_name => 'Shoppe::CitiesZone'
    has_many  :cities, through: :cities_zones, :class_name => 'Shoppe::City'
    validates :name, :presence => true
  end
end
