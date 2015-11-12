module Shoppe
  class LogisticsController < Shoppe::ApplicationController
	  before_filter { @supplier, @customer = params[:supplier], params[:customer] }
	
  	def index
      @zones = Shoppe::Zone.all
  	  @suppliers = Shoppe::Supplier.all
  	  @last_mile_companies = Shoppe::LastMileCompany.all
  	  @freight_companies =  Shoppe::FreightCompany.all
  	  @freight_routes = Shoppe::FreightRoute.all
    end

    def search
      @customer_zones, @supplier_zones = Shoppe::Zone.customer_search(params[:customer]),Shoppe::Zone.supplier_search(params[:supplier])
  	  @zones = (@customer_zones + @supplier_zones).uniq
  	  @suppliers = Shoppe::Supplier.search(@supplier_zones)
      @last_mile_companies = Shoppe::LastMileCompany.search(@zones)   
      @freight_companies =  Shoppe::FreightCompany.search(@zones)
  	  @freight_routes = Shoppe::FreightRoute.search(@supplier_zones, @customer_zones)
      render "index"
    end
  end
end
