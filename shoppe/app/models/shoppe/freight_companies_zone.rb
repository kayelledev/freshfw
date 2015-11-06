module Shoppe
  class FreightCompaniesZone < ActiveRecord::Base
  	belongs_to :freight_company
    belongs_to :zone
    validates :freight_company_id, uniqueness: {scope: :zone_id}
  end
end
