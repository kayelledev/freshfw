class RoomController < ApplicationController
  load_and_authorize_resource :class => 'RoomController'

  def index
    @products = Product.all
  end

  def edit
    @product = Product.find(params[:preset])

    @items = Product.all
    @categories = ProductCategory.all
  end

  def save
    params[:products].each do |item|
      Product.find(item[0]).update_attributes(posX: item[1][:posX], posY: item[1][:posY], rotation: item[1][:rotation])
    end

    render json: true
  end
end
