module Shoppe
  class ZonesController < Shoppe::ApplicationController
  	before_filter { params[:id] && @zone = Shoppe::Zone.find(params[:id]) }
    load_and_authorize_resource
  	
    def new
  	  @zone = Shoppe::Zone.new
  	end

  	def show
  	end

  	def edit
    end

    def index
      redirect_to :logistics
    end

    def create
      @zone = Shoppe::Zone.new(safe_params)
      if @zone.save
        redirect_to @zone, :flash => {:notice =>  t('shoppe.logistics.zones.create_notice') }
      else
        render :action => "new"
      end
    end

    def update
      if @zone.update(safe_params)
        redirect_to @zone, :flash => {:notice => t('shoppe.logistics.zones.update_notice') }
      else
        render :action => "edit"
      end
    end

    def destroy
      @zone.destroy
      redirect_to :logistics, :flash => {:notice => t('shoppe.logistics.zones.destroy_notice')}
    end

    private

    def safe_params
      params[:zone].permit(:name, :cities_attributes => [:id, :name, :province, :country_id])
    end
  end
end
