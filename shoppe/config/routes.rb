require 'sidekiq/web'
Shoppe::Engine.routes.draw do

  get 'attachment/:id/:filename.:extension' => 'attachments#show'
  resources :product_categories
  resources :products do
    resources :variants
    collection do
      get :import
      post :import
    end
  end
  resources :orders do
    collection do
      post :search
    end
    member do
      post :accept
      post :reject
      post :ship
      get :despatch_note
    end
    resources :payments, :only => [:create, :destroy] do
      match :refund, :on => :member, :via => [:get, :post]
    end
  end
  resources :stock_level_adjustments, :only => [:index, :create]
  resources :delivery_services do
    resources :delivery_service_prices
  end
  resources :tax_rates
  resources :users
  resources :countries
  resources :logistics do
    collection do
      post :search
    end
  end
  resources :zones do
    resources :cities
  end
  resources :freight_routes
  resources :suppliers
  resources :last_mile_companies
  resources :freight_companies
  
  resources :roles_permissions
  resources :roles
  resources :permissions
  resources :design_projects do
    member do
      post :reject
      post :approve
      post :request_revision
    end
  end
  get 'designer-portal', to: 'design_projects#project_info'
  get 'designer-portal/select_items', to: 'design_projects#select_items'
  get 'designer-portal/room_builder', to: 'design_projects#room_builder'
  get 'designer-portal/instructions', to: 'design_projects#instructions'
  post 'designer-portal/create', to: 'design_projects#create'
  patch 'designer-portal/create', to: 'design_projects#create'
  post 'designer-portal/add_to_room_builder', to: 'design_projects#add_to_room_builder'
  post 'designer-portal/items_filtering', to: 'design_projects#items_filtering'
  delete 'designer-portal/remove_product', to: 'design_projects#remove_product'
  get 'design_portals/:id', to: 'design_projects#edit'
  patch 'designer-portal/save_room_layout', to: 'design_projects#save_room_layout'
  patch 'designer-portal/save_furniture_board', to: 'design_projects#save_furniture_board'
  patch 'designer-portal/layout_submit_room', to: 'design_projects#layout_submit_room'
  patch 'designer-portal/board_submit_room', to: 'design_projects#board_submit_room'


  get 'design_portals/:id', to: 'design_projects#edit'


  get 'get_controller_options' => 'permissions#get_controller_options'
  resources :attachments, :only => :destroy

  get 'settings'=> 'settings#edit'
  post 'settings' => 'settings#update'

  get 'login' => 'sessions#new'
  post 'login' => 'sessions#create'
  match 'login/reset' => 'sessions#reset', :via => [:get, :post]

  delete 'logout' => 'sessions#destroy'

  authenticate :user, lambda { |u| u.admin? } do
    mount Sidekiq::Web => '/sidekiq'
  end

  root :to => 'dashboard#home'
end
