module Shoppe
  class LastMileCompaniesZone < ActiveRecord::Base
  	belongs_to :last_mile_company
    belongs_to :zone
    validates :last_mile_company_id, uniqueness: {scope: :zone_id}
  end
end
