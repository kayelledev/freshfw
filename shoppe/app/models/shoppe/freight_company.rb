module Shoppe
  class FreightCompany < ActiveRecord::Base
  	has_many  :freight_companies_zones, dependent: :destroy
    has_many  :zones, through: :freight_companies_zones
  end
end
