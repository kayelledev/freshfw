module Shoppe
  class ProductsController < Shoppe::ApplicationController

    before_filter { @active_nav = :products }
    before_filter { params[:id] && @product = Shoppe::Product.root.find(params[:id]) }

    def index
      @products = Shoppe::Product.root.includes(:stock_level_adjustments, :product_category, :variants).order(:name).group_by(&:product_category).sort_by { |cat,pro| cat.id }
    end

    def new
      @product = Shoppe::Product.new
    end

    def create
      @product = Shoppe::Product.new(safe_params)
      if @product.save
        redirect_to :products, :flash => {:notice =>  t('shoppe.products.create_notice') }
      else
        render :action => "new"
      end
    end

    def edit
    end

    def update
      if @product.update(safe_params)
        @product.update_included_products params[:included] if params[:included]
        redirect_to [:edit, @product], :flash => {:notice => t('shoppe.products.update_notice') }
      else
        render :action => "edit"
      end
    end

    def destroy
      @product.destroy
      redirect_to :products, :flash => {:notice =>  t('shoppe.products.destroy_notice')}
    end

    def import
      if request.post?
        if params[:import].nil?
          redirect_to import_products_path, :flash => {:alert => I18n.t('shoppe.imports.errors.no_file')}
        else
          Shoppe::Product.import(params[:import][:import_file])
          redirect_to products_path, :flash => {:notice => I18n.t("shoppe.products.imports.success")}
        end
      end
    end

    private

    def safe_params
      params[:product].permit(:product_category_id, :name, :sku, :permalink, :description,
                              :short_description, :weight, :price, :cost_price, :tax_rate_id,
                              :stock_control, :default_image, :image2, :image3,:image4,:image5,:image6,
                              :default_image_file_sheet_file, :active, :featured, :in_the_box, :image,
                              :width, :height, :is_preset,
                              :product_attributes_array => [:key, :value, :searchable, :public], :included=>[])
    end

  end
end
