module Shoppe
  class FreightCompany < ActiveRecord::Base
  	has_many  :freight_companies_zones, dependent: :destroy, :class_name => 'Shoppe::FreightCompaniesZone'
    has_many  :zones, through: :freight_companies_zones, :class_name => 'Shoppe::Zone'
  end
end
