module Shoppe
  class SuppliersController < Shoppe::ApplicationController
  	before_filter { params[:id] && @supplier = Shoppe::Supplier.find(params[:id]) }
    # load_and_authorize_resource
  	def new
  	  @supplier = Shoppe::Supplier.new
  	end

  	def show
  	end

  	def edit
    end

    def index
      redirect_to :logistics
    end

    def create
      @supplier = Shoppe::Supplier.new(safe_params)
      if @supplier.save
        redirect_to @supplier, :flash => {:notice =>  t('shoppe.logistics.suppliers.create_notice') }
      else
        render :action => "new"
      end
    end

    def update
      if @supplier.update(safe_params)
        redirect_to @supplier, :flash => {:notice => t('shoppe.logistics.suppliers.update_notice') }
      else
        render :action => "edit"
      end
    end

    def destroy
      @supplier.destroy
      redirect_to :logistics, :flash => {:notice => t('shoppe.logistics.suppliers.destroy_notice')}
    end

    private

    def safe_params
      params[:supplier][:zone_ids] ||= []
      params[:supplier].permit(:name, :warehouse, :website, :prime, :notes, :zone_ids => [])
    end
  end
end
