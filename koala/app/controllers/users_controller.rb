class UsersController < ApplicationController
	
	def index
		@users = User.all
	end
	
	def new
		@user = User.new
	end
	
	def create
		@user = User.new(params[:user])
		@p2 = params[:p2]
		
		if( @user.password != @p2 )
			render :action => 'new'
		else
			
			@user.join_date = Time.now
			if @user.save
				redirect_to(@user)
			else
				render :action => 'new'
			end
			
		end
	end
	
	def show
		@user = User.find(params[:id])
	end
	
	def edit
		@user = User.find(params[:id])
	end
	
	def update
		@user = User.new(params[:id])
		if @user.save
			redirect_to(@user)
		else
			render :action => 'edit'
		end
	end
	
end
