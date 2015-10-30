class Review < ActiveRecord::Base
  belongs_to :user
  belongs_to :product
  validates :user_id, :uniqueness => { :scope => :product_id,
    :message => "Users may only write one review per product." }
end
