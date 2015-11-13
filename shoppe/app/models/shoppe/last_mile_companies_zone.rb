module Shoppe
  class LastMileCompaniesZone < ActiveRecord::Base
  	belongs_to :last_mile_company, :class_name => 'Shoppe::LastMileCompany'
    belongs_to :zone, :class_name => 'Shoppe::Zone'
    validates :last_mile_company_id, uniqueness: {scope: :zone_id}
  end
end
