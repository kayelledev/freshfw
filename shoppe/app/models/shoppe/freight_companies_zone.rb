module Shoppe
  class FreightCompaniesZone < ActiveRecord::Base
  	belongs_to :freight_company, :class_name => 'Shoppe::FreightCompany'
    belongs_to :zone, :class_name => 'Shoppe::Zone'
    validates :freight_company_id, uniqueness: {scope: :zone_id}
  end
end
