class Project < ActiveRecord::Base
	validates :title, :presence => true
	validates :author, :presence => true
	validates :code, :presence => true
end
