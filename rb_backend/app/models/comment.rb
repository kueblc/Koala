class Comment < ActiveRecord::Base
  belongs_to :User
  has_one :Project
  
  validates :user_id, :presence => true
  validates :project_id, :presence => true
  validates :content, :presence => true
  validates :date_posted, :presence => true
end
