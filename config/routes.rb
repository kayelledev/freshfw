Rails.application.routes.draw do
  devise_for :users, :controllers => { omniauth_callbacks: 'omniauth/callbacks' }

  devise_scope :user do
    match 'create_user' => 'omniauth/callbacks#create_user', as: :create_user, via: :post
    match 'user_prompt' => 'omniauth/callbacks#user_prompt', as: :user_prompt, via: :get
  end

  #mount Shoppe::Engine => "/shoppe"
  mount Shoppe::Engine => "/shoppe"
  get 'welcome/index'
  get 'welcome/about_us', to: 'welcome#about_us', as: 'about_us'
  
  resources :charges

  #show, buying products
  resources :products, only: [:index, :show] do
    member do
      post 'buy'
    end
  end
  
  #show product_categories
  get "room_type", to: "product_categories#index_type"
  get "room_size", to: "product_categories#index_size"

  #adding products to basket
  get "cart", to: "orders#show"
  delete "cart", to: "orders#destroy"
  post 'cart/:order_item_id', to: 'orders#remove', as: :remove_from_order
  
  #checking out
  match "checkout", to: "orders#checkout", as: "checkout", via: [:get, :patch]
  match "checkout/pay", to: "orders#payment", as: "checkout_payment", via: [:get, :post]
  match "checkout/confirm", to: "orders#confirmation", as: "checkout_confirmation", via: [:get, :post]
  match "order/:id/refresh_items", to: "orders#refresh_items", as: "refresh_order_items", via: [:get, :post]
  # The priority is based upon order of creation: first created -> highest priority.
  # See how all your routes lay out with "rake routes".

  # You can have the root of your site routed with "root"
  root 'welcome#index'

#Karen added to test all functions with Users 

  # Example of regular route:
  #   get 'products/:id' => 'catalog#view'

  # Example of named route that can be invoked with purchase_url(id: product.id)
  #   get 'products/:id/purchase' => 'catalog#purchase', as: :purchase

  # Example resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Example resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Example resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Example resource route with more complex sub-resources:
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', on: :collection
  #     end
  #   end

  # Example resource route with concerns:
  #   concern :toggleable do
  #     post 'toggle'
  #   end
  #   resources :posts, concerns: :toggleable
  #   resources :photos, concerns: :toggleable

  # Example resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end
end
