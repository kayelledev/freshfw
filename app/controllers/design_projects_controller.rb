class DesignProjectsController < ApplicationController
 load_and_authorize_resource :class => 'DesignProjectsController'
 
  def project_info
  end

  def select_items
  end

  def room_builder
    @project = Product.find_by(sku: 3)
  end

  def instructions
  end
end
