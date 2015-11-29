class Product < Shoppe::Product
  has_many :reviews
  has_many :users, through: :reviews

  self.table_name = 'shoppe_products'
end
