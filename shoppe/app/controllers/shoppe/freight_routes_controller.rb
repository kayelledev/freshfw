module Shoppe
  class FreightRoutesController < Shoppe::ApplicationController
  	before_filter { params[:id] && @freight_route = Shoppe::FreightRoute.find(params[:id]) }

  	def new
  	  @freight_route = Shoppe::FreightRoute.new
  	end

  	def show
  	end

  	def edit
    end

    def create
      @freight_route = Shoppe::FreightRoute.new(safe_params)
      if @freight_route.save
        redirect_to @freight_route, :flash => {:notice =>  t('shoppe.logistics.freight_routes.create_notice') }
      else
        render :action => "new"
      end
    end

    def update
      if @freight_route.update(safe_params)
        redirect_to :logistics, :flash => {:notice => t('shoppe.logistics.freight_routes.update_notice') }
      else
        render :action => "edit"
      end
    end

    def destroy
      @freight_route.destroy
      redirect_to :logistics, :flash => {:notice => t('shoppe.logistics.freight_routes.destroy_notice')}
    end

    private

    def safe_params
      params[:freight_route].permit(:travel_days, :zone_id, :suppliers_zone_id, :freight_company_id)
    end
  end
end
