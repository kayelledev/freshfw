module Shoppe
  class LastMileCompany < ActiveRecord::Base
  	has_many  :last_mile_companies_zones, dependent: :destroy
    has_many  :zones, through: :last_mile_companies_zones
  end
end
