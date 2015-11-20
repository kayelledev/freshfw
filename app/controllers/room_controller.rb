class RoomController < ApplicationController
  load_and_authorize_resource :class => 'RoomController'
  
  def index
    @products = Shoppe::Product.all
  end

  def edit
    @product = Shoppe::Product.find(params[:preset])

    @items = Shoppe::Product.all
    @categories = Shoppe::ProductCategory.all
  end

  def save
    params[:position].each do |item|
      Shoppe::Product.find(item[0]).update_attributes(posX: item[1][:posX], posY: item[1][:posY], rotation: item[1][:rotation])
    end

    redirect_to '/room_editor'
  end
end
