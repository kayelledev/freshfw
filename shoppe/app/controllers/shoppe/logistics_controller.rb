module Shoppe
  class LogisticsController < Shoppe::ApplicationController
	def index
	# TODO search result 
	  if params[:supplier].present? || params[:customer].present?
	  	@customer_zones, @supplier_zones = Shoppe::Zone.customer_search(params[:customer]),Shoppe::Zone.supplier_search(params[:supplier])
	  	@supplier, @customer = params[:supplier], params[:customer]
	  	# TODO @customer_zones show all zones
	  	@freight_routes = Shoppe::FreightRoute.all
   	    @zones = Shoppe::Zone.all
	    @suppliers = Shoppe::Supplier.all
	    @last_mile_companies = Shoppe::LastMileCompany.all
	    @freight_companies =  Shoppe::FreightCompany.all
	  else
	    @freight_routes = Shoppe::FreightRoute.all
   	    @zones = Shoppe::Zone.all
	    @suppliers = Shoppe::Supplier.all
	    @last_mile_companies = Shoppe::LastMileCompany.all
	    @freight_companies =  Shoppe::FreightCompany.all
      end
    end

    def search
      index
      render :action => "index"
    end
  end
end
